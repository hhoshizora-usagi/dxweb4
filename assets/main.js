(function () {
    'use strict';
    var body = document.body;
    var media = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : {matches: false};
    var motion = !media.matches;
    var animations = [];

    var revealObserver;
    if (motion && 'IntersectionObserver' in window) {
        revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var item = entry.target;
                revealObserver.unobserve(item);
                item.classList.add('is-visible');
                if (typeof item.animate === 'function') {
                    var siblings = item.parentElement.children;
                    var index = Array.prototype.indexOf.call(siblings, item);
                    var delay = Math.min(index % 5, 4) * 65;
                    animations.push(item.animate([
                        {transform: 'translate3d(0,16px,0)'},
                        {transform: 'translate3d(0,0,0)'}
                    ], {duration: 820, delay: delay, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards'}));
                }
            });
        }, {threshold: 0.08});
        document.querySelectorAll('.reveal,.route li,.hero-copy').forEach(function (item) {
            var rect = item.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {item.classList.add('is-visible'); return;}
            revealObserver.observe(item);
        });
    } else {
        document.querySelectorAll('.route li').forEach(function (item) {item.classList.add('is-visible');});
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-visual .slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    var caption = document.querySelector('.hero-caption');
    var current = 0, timer, paused = !motion, pauseButton;
    function go(index) {
        slides[current].classList.remove('on');
        if (dots[current]) {dots[current].classList.remove('on'); dots[current].setAttribute('aria-pressed', 'false');}
        current = index;
        slides[current].classList.add('on');
        if (dots[current]) {dots[current].classList.add('on'); dots[current].setAttribute('aria-pressed', 'true');}
        if (caption) caption.textContent = slides[current].getAttribute('data-cap') || '';
    }
    function stop() {if (timer) clearInterval(timer); timer = null;}
    function start() {
        stop();
        if (!paused && motion && !document.hidden) timer = setInterval(function () {go((current + 1) % slides.length);}, 6500);
    }
    if (slides.length > 1) {
        dots.forEach(function (dot, index) {
            dot.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
            dot.addEventListener('click', function () {go(index); start();});
        });
        if (motion) {
            pauseButton = document.createElement('button');
            pauseButton.type = 'button'; pauseButton.className = 'slider-toggle';
            pauseButton.textContent = '一時停止'; pauseButton.setAttribute('aria-label', 'スライドショーを一時停止');
            document.querySelector('.hero-visual').appendChild(pauseButton);
            pauseButton.addEventListener('click', function () {
                paused = !paused;
                pauseButton.textContent = paused ? '再生' : '一時停止';
                pauseButton.setAttribute('aria-label', paused ? 'スライドショーを再生' : 'スライドショーを一時停止');
                start();
            });
        }
        document.addEventListener('visibilitychange', start);
        start();
    }

    var menuButton = document.querySelector('.menu-btn');
    var nav = document.getElementById('goal-navigation');
    function closeMenu(returnFocus) {
        body.classList.remove('menu-open');
        if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
        if (returnFocus && menuButton) menuButton.focus();
    }
    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            var open = body.classList.toggle('menu-open');
            menuButton.setAttribute('aria-expanded', String(open));
            if (open) {var first = nav.querySelector('a'); if (first) first.focus();}
        });
        nav.addEventListener('click', function (event) {if (event.target.closest('a')) closeMenu(false);});
        document.addEventListener('keydown', function (event) {
            if (!body.classList.contains('menu-open')) return;
            if (event.key === 'Escape') closeMenu(true);
            if (event.key === 'Tab') {
                var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
                var first = links[0], last = menuButton;
                if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
                else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
            }
        });
        document.addEventListener('click', function (event) {if (!event.target.closest('header.site')) closeMenu(false);});
        window.addEventListener('resize', function () {if (window.innerWidth > 1024) closeMenu(false);});
    }

    var topButton = document.querySelector('.pagetop');
    var floatCta = document.querySelector('.float-cta');
    var progress = document.querySelector('.reading-progress');
    var header = document.querySelector('header.site');
    var scheduled = false;
    function scrollState() {
        scheduled = false;
        var y = window.pageYOffset || 0;
        if (topButton) topButton.classList.toggle('show', y > 500);
        if (floatCta) floatCta.classList.toggle('show', y > 500);
        if (header) header.classList.toggle('is-scrolled', y > 30);
        if (progress) {
            var height = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.transform = 'scaleX(' + (height > 0 ? Math.min(y / height, 1) : 0) + ')';
        }
    }
    window.addEventListener('scroll', function () {
        if (!scheduled) {scheduled = true; window.requestAnimationFrame(scrollState);}
    }, {passive: true});
    window.addEventListener('resize', scrollState);
    scrollState();
    if (topButton) topButton.addEventListener('click', function () {
        window.scrollTo({top: 0, behavior: motion ? 'smooth' : 'auto'});
    });
    function reduceMotion(event) {
        motion = !event.matches;
        if (!motion) {
            stop();
            animations.forEach(function (animation) {animation.cancel();});
            if (revealObserver) revealObserver.disconnect();
            if (pauseButton) pauseButton.hidden = true;
        }
    }
    if (media.addEventListener) media.addEventListener('change', reduceMotion);
    else if (media.addListener) media.addListener(reduceMotion);
})();
