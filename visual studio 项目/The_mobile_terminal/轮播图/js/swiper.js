/**
 构造函数
 函数名
 Swiper

 参数
 * 选择器
 * 选项

 使用示例
 new Swiper('#swiper-container', {
        loop: true, //是否为无缝滚动
        auto: true, //是否为自动执行
        time: 2000, // 时间间隔
        pagination: true // 是否显示小圆点
    });

 new Swiper('#swiper-container);// loop : truen, auto: true, time: 2000,  pagination: true
 */
//函数声明
function Swiper(selector, options) {
    //获取选项的参数
    var loop = options !== undefined && options.loop !== undefined ? options.loop : true;
    var auto = options !== undefined && options.auto !== undefined ? options.auto : true;
    var time = options !== undefined && options.time !== undefined ? options.time : 2000;
    var pagination = options !== undefined && options.pagination !== undefined ? options.pagination : true;

    //获取元素
    var swiperContainer = document.querySelector(selector);
    var swiperWrapper = swiperContainer.querySelector('.swiper-wrapper');
    var dots = swiperContainer.getElementsByTagName('span');
    var index = 0;
    var len = swiperWrapper.querySelectorAll('.swiper-slide').length;
    //wrap内容复制一份
    //如果是无缝滚动则复制一份包裹元素内容
    if (loop) {
        swiperWrapper.innerHTML += swiperWrapper.innerHTML;
    }
    var length = swiperWrapper.querySelectorAll('.swiper-slide').length;
    //获取幻灯片元素
    var swiperSlides = swiperWrapper.querySelectorAll('.swiper-slide');
    //获取导航的包裹元素
    var swiperPagination = swiperContainer.querySelector('.swiper-pagination');
    swiperContainer.timer = null;
    //状态变量
    var isFirst = null;// 标记当前是否为第一次移动
    var isHori = null; // 标记当前是否为水平滑动

    //初始化
    // 判断个数, 进行样式的设置 初始化
    swiperContainer.init = function () {
        swiperContainer.style.position = 'relative';
        //设置宽度
        swiperWrapper.style.width = length + '00%';
        //设置单个元素的宽度
        for (var i = 0; i < length; i++) {
            swiperSlides[i].style.width = 100 / length + '%';
        }
        window.addEventListener('load', function () {
            //设置高度
            swiperContainer.style.height = swiperSlides[0].offsetHeight + 'px';
            //点的设置
            if(!pagination) return;
            for (var i = 0; i < len; i++) {
                //创建元素
                var span = document.createElement('span');
                //增加激活状态
                if (i == 0) span.className = 'active';
                swiperPagination.appendChild(span);
            }
        });

    }
    swiperContainer.init();

    //自动播放功能
    swiperContainer.autoRun = function () {
        //如果自动执行为 假 则直接跳出方法
        if(!auto) return;
        clearInterval(this.timer);
        // 定时器
        swiperContainer.timer = setInterval(function () {
            //索引自增
            index++;
            //切换幻灯片
            swiperContainer.switchSlide(index);
        }, time);
    }
    swiperContainer.autoRun();

    //切换幻灯片
    /**
     *  swiperContainer.switchSlide(1)   默认使用过渡切换
     *  swiperContainer.switchSlide(1, true)   使用过渡切换
     *
     *  swiperContainer.switchSlide(2, false)   不使用过渡切换
     */
    swiperContainer.switchSlide = function (indexes, isTransition) {
        //判断isTransition 的值  用户是否传递了该参数
        //  swipeContainer.switchSlide(2);
        if (isTransition === undefined) {
            isTransition = true;
        }
        // 最大值  4  最小值  0
        if (indexes <= 0) {
            indexes = 0;
        }

        if (indexes >= length - 1) {
            indexes = length - 1;
        }
        //设置元素的过渡
        if (isTransition) {
            swiperWrapper.style.transition = 'all 0.5s';
        } else {
            swiperWrapper.style.transition = 'none';
        }
        // indexes 0    1      2      3       indexes
        // left  0    -375   -750   -1125   -375*indexes
        //计算当前索引对应的 left 的值
        var newLeft = -swiperContainer.offsetWidth * indexes;
        //设置样式  transform: translateX(-100px)
        // swiperWrapper.style.transform = 'translate(-100px)';
        // transformCSS(swiperWrapper, 'translateX', -100);
        // swiperWrapper.style.left   =====>  transformCSS(swiperWrapper, 'translateX', newLeft);
        // transform  translateX 水平位移  -100   left -100px
        transformCSS(swiperWrapper, 'translateX', newLeft);
        //改变小圆点的状态
        //清除所有小圆点的active
        if(pagination){
            for (var i = 0; i < dots.length; i++) {
                dots[i].className = '';
            }
            //当前增加 active   1 2 3 4 5 6 7 8
            //                     ||
            //                     ||
            //                     \/
            //                  1 2 3 4
            dots[indexes % len].className = 'active';
        }
        //赋值给全局的 index 索引
        index = indexes;
    }

    //绑定 touchstart 事件
    swiperContainer.addEventListener('touchstart', function (e) {
        //获取触点的位置
        /**
         * 1. changedTouches   同时按下的触点信息
         * 2. targetTouches  target 目标  事件源  目标元素上的触点信息数组
         * 3. touches  屏幕上触点的信息数组
         */
        //获取当前的时间 毫秒
        this.startTime = Date.now();
        //如果是无缝滚动 则需要对当前的索引进行判断
        if(loop){
            //判断当前的索引 如果在最左侧
            if (index == 0) {
                index = len;
                swiperContainer.switchSlide(index, false);
            }
            //如果在最右侧
            if (index == length - 1) {
                index = len - 1;
                swiperContainer.switchSlide(index, false);
            }
        }
        this.x = e.changedTouches[0].clientX; // 2
        this.y = e.changedTouches[0].clientY;
        //获取起始位置状态下  wrapper 的偏移量
        this.left = transformCSS(swiperWrapper, 'translateX'); // a
        //移除过渡
        swiperWrapper.style.transition = 'none';
        //停止定时器
        clearInterval(this.timer);
        //装填变量赋值
        isFirst = true;
    });

    //手指移动事件
    swiperContainer.addEventListener('touchmove', function (e) {
        this._x = e.changedTouches[0].clientX; // 1
        this._y = e.changedTouches[0].clientY;

        //X 轴距离差
        var disX = Math.abs(this._x - this.x);
        var disY = Math.abs(this._y - this.y);

        /*if(disX > disY){
            e.preventDefault();
        } else {
            return;
        }*/
        //检测是否为第一次滑动
        if (isFirst) {
            isFirst = false;//锁
            //水平大于 垂直
            if (disX > disY) {
                isHori = true;
            }
            if (disX < disY) {
                isHori = false;
            }
        }
        if (!isHori) return;
        //计算出新的left 值
        var newLeft = this._x - this.x + this.left;
        //设置样式
        transformCSS(swiperWrapper, 'translateX', newLeft);
        e.preventDefault();
    });

    //手指离开事件
    swiperContainer.addEventListener('touchend', function (e) {
        //启动定时器
        this.autoRun();
        if (!isHori) return;
        //手指离开时的触点位置
        this._x = e.changedTouches[0].clientX;
        //判断滑动距离是否超过 容器宽度的一半
        var disX = Math.abs(this._x - this.x);
        //获取手指离开的事件
        this.endTime = Date.now();
        var disTime = this.endTime - this.startTime;

        if (disX > swiperContainer.offsetWidth / 2 || disTime <= 300) {
            //判断
            if (this._x > this.x) {
                index--;
            }
            if (this._x < this.x) {
                index++;
            }
        }
        //切换幻灯片
        this.switchSlide(index);

    });

    //过渡结束后的事件
    loop && swiperWrapper.addEventListener('transitionend', function () {
        // if(loop){
            //检测是否到了最右侧
            if (index >= length - 1) {
                //如果到了最右侧  设置 index 为中间值 并改变 wrapper 的位置
                index = len - 1;
                swiperContainer.switchSlide(index, false);
            }
        // }
    });

    this.name = 'iloveyou';
}
