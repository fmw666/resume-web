$(window).on('load', function() {
    "use strict";

    /*=========================================================================
    Config read
    =========================================================================*/
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      $('.light').each(function() {
        $(this).removeClass('light');
      });

      $('body').addClass('dark');
      $('.service-box').addClass('dark');

      localStorage.setItem('theme', 'dark');

      $('#theme-icon .moon-sun').css('transform', 'translateX(30px)');
    } else {
      localStorage.setItem('theme', 'light');
    }

    /*=========================================================================
    Fetch data
    =========================================================================*/
    // const fetchRequestInfo = fetch('http://127.0.0.1:8000/api/resume/info').then(response => response.json());
    // const fetchRequest2 = fetch('https://api.vvhan.com/api/en').then(response => response.json());

    // Promise.all([fetchRequestInfo, fetchRequest2])
    Promise.all([])
      // .then(values => {
      //   const info = values[0];
      //   const commits = values[1];

      //   console.log(info);
      //   console.log(commits);

      //   $('#home-name').text(info.en_name);
      //   $('#home-desc').text(info.short_job_desc);
      //   $('#about-introduce').text(info.introduce);
      //   $('#wechat-link').attr('href', info.wechat_url);
      //   $('#github-link').attr('href', info.github_url);
      // })
      .catch(error => {
        console.error(error);
      })
      .finally(() => {
        /*=========================================================================
        Preloader
        =========================================================================*/
        $("#preloader").delay(350).fadeOut('slow');
        // Because only Chrome supports offset-path, feGaussianBlur for now
        var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

        if(!isChrome) {
          document.getElementsByClassName('infinityChrome')[0].style.display = "none";
          document.getElementsByClassName('infinity')[0].style.display = "block";
        }

        /*=========================================================================
        Text Rotating
        =========================================================================*/
        $(".text-rotating").Morphext({
          // The [in] animation type. Refer to Animate.css for a list of available animations.
          animation: "bounceIn",
          // An array of phrases to rotate are created based on this separator. Change it if you wish to separate the phrases differently (e.g. So Simple | Very Doge | Much Wow | Such Cool).
          separator: ",",
          // The delay between the changing of each phrase in milliseconds.
          speed: 4000,
          complete: function () {
              // Called after the entrance animation is executed.
          }
        });
      });

    /*=========================================================================
    Wow Initialize
    =========================================================================*/
    // Here will be the WoW Js implementation.
    setTimeout(function(){new WOW().init();}, 0);

    var dynamicDelay = [
      200,
      400,
      600,
      800,
      1000,
      1200,
      1400,
      1600,
      1800,
      2000
    ];
    var fallbackValue = "200ms";
  
    $(".blog-item.wow").each(function(index) {
      $(this).attr("data-wow-delay", typeof dynamicDelay[index] === 'undefined' ? fallbackValue : dynamicDelay[index] + "ms");
    });

    /*=========================================================================
    Isotope
    =========================================================================*/
    $('.portfolio-filter').on( 'click', 'li', function() {
        var filterValue = $(this).attr('data-filter');
        $container.isotope({ filter: filterValue });
    });

    // change is-checked class on buttons
    $('.portfolio-filter').each( function( i, buttonGroup ) {
        var $buttonGroup = $( buttonGroup );
        $buttonGroup.on( 'click', 'li', function() {
            $buttonGroup.find('.current').removeClass('current');
            $( this ).addClass('current');
        });
    });

    var $container = $('.portfolio-wrapper');
    $container.imagesLoaded( function() {
      $('.portfolio-wrapper').isotope({
          // options
          itemSelector: '[class*="col-"]',
          percentPosition: true,
          masonry: {
              // use element for option
              columnWidth: '[class*="col-"]'
          }
      });
    });

    var bolbyPopup = function(){
      /*=========================================================================
              Magnific Popup
      =========================================================================*/
      // don't need to use this function, just for demo purpose
      // $('.close-popup').on('click', function() {
      //   $.magnificPopup.close(); // Close the Magnific Popup
      // });

      $('.work-image').magnificPopup({
        type: 'image',
        closeBtnInside: false,
        mainClass: 'my-mfp-zoom-in',
      });

      $('.work-content').magnificPopup({
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        closeBtnInside: false,
        preloader: false,
        midClick: true,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in'
      });

      $('.work-link').magnificPopup({
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        closeBtnInside: false,
        preloader: false,
        midClick: true,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          open: function() {
            // 修改弹出层 iframe 的宽度和高度为 100%
            $('.mfp-iframe').css({
              'width': '100%',
              'height': '60vh', // 设置高度为屏幕高度
            });
          }
        }  
      });

      $('.work-video').magnificPopup({
        type: 'iframe',
        closeBtnInside: false,
        iframe: {
          markup: '<div class="mfp-iframe-scaler">'+
                    '<div class="mfp-close"></div>'+
                    '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>'+
                  '</div>', 

          patterns: {
            youtube: {
              index: 'youtube.com/',

              id: 'v=',

              src: 'https://www.youtube.com/embed/%id%?autoplay=1'
            },
            vimeo: {
              index: 'vimeo.com/',
              id: '/',
              src: '//player.vimeo.com/video/%id%?autoplay=1'
            },
            gmaps: {
              index: '//maps.google.',
              src: '%id%&output=embed'
            }

          },

          srcAction: 'iframe_src',
        },
        callbacks: {
          open: function() {
            // 修改弹出层 iframe 的宽度和高度为 100%
            $('.mfp-iframe').css({
              'width': '100%',
              'height': $(window).height() - 100, // 设置高度为屏幕高度
            });
          }
        }  
      });

      $('.gallery-link').on('click', function () {
          $(this).next().magnificPopup('open');
      });

      $('.gallery').each(function () {
          $(this).magnificPopup({
              delegate: 'a',
              type: 'image',
              closeBtnInside: false,
              gallery: {
                  enabled: true,
                  navigateByImgClick: true
              },
              fixedContentPos: false,
              mainClass: 'my-mfp-zoom-in',
          });
      });
    }

    bolbyPopup();

    /*=========================================================================
     Infinite Scroll
     =========================================================================*/
    var curPage = 1;
    var pagesNum = $(".portfolio-pagination").find("li a:last").text();   // Number of pages

    $container.infinitescroll({
        itemSelector: '.grid-item',
        nextSelector: '.portfolio-pagination li a',
        navSelector: '.portfolio-pagination',
        extraScrollPx: 0,
        bufferPx: 0,
        maxPage: 6,
        loading: {
            finishedMsg: "No more works",
            msgText: '',
            speed: 'slow',
            selector: '.load-more',
        }
    },
    // trigger Masonry as a callback
    function( newElements ) {

      var $newElems = $( newElements );
      $newElems.imagesLoaded(function(){  
        $newElems.animate({ opacity: 1 });
        $container.isotope( 'appended', $newElems );
      });

      bolbyPopup();

      // Check last page
      curPage++;
      if(curPage == pagesNum) {
        $( '.load-more' ).remove();
      }

    });

    $container.infinitescroll( 'unbind' );

    $( '.load-more .btn' ).on('click', function() {
      $container.infinitescroll( 'retrieve' );
      // display loading icon
      $( '.load-more .btn i' ).css('display', 'inline-block');
      $( '.load-more .btn i' ).addClass('fa-spin');

      $(document).ajaxStop(function () {
        setTimeout(function(){
               // hide loading icon
          $( '.load-more .btn i' ).hide();
        }, 1000);
      });
      return false;
    });

    /* ======= Mobile Filter ======= */

    // bind filter on select change
    $('.portfolio-filter-mobile').on( 'change', function() {
      // get filter value from option value
      var filterValue = this.value;
      // use filterFn if matches value
      filterValue = filterFns[ filterValue ] || filterValue;
      $container.isotope({ filter: filterValue });
    });

    var filterFns = {
      // show if number is greater than 50
      numberGreaterThan50: function() {
        var number = $(this).find('.number').text();
        return parseInt( number, 10 ) > 50;
      },
      // show if name ends with -ium
      ium: function() {
        var name = $(this).find('.name').text();
        return name.match( /ium$/ );
      }
    };
});

$(document).on('ready', function() {
    "use strict";

    /*=========================================================================
                Slick Slider
    =========================================================================*/
    $('.testimonials-wrapper').slick({
      dots: true,
      arrows: false,
      autoplay: true,
      autoplaySpeed: 3000
    });

    $('#theme-icon').on('click', function (event) {
      event.preventDefault();

      // get theme config
      var theme = localStorage.getItem('theme');

      if (theme === 'dark') {
        // remove dark

        $('body').removeClass('dark');
        $('.service-box').removeClass('dark');

        // add light

        // spacer
        $('.spacer').addClass('light');
        // preloader
        $('#preloader').addClass('light');
        // desktop-header-1
        $('header.desktop-header-1').addClass('light');
        // mobile-header-1
        $('header.mobile-header-1').addClass('light');
        // main.content
        $('main.content').addClass('light');
        // scroll-down
        $('.scroll-down').addClass('light');
        // section
        $('.content section').addClass('light');
        // btn
        $('.btn-default').addClass('light');
        // .fact-item .number em
        $('.fact-item .number em').addClass('light');
        // .shadow-dark
        $('.shadow-dark').addClass('light');
        // .desktop-header-3 .dropdown-menu
        $('.desktop-header-3 .dropdown-menu').addClass('light');
        // .form-control
        $('.form-control').addClass('light');
        // .form-control:focus
        $('.form-control:focus').addClass('light');
        // .skill-item .skill-info h4
        $('.skill-item .skill-info h4').addClass('light');
        // .service-box h3
        $('.service-box h3').addClass('light');
        // .timeline .content h3
        $('.timeline .content h3').addClass('light');
        // .portfolio-filter li.list-inline-item
        $('.portfolio-filter li.list-inline-item').addClass('light');
        // .price-item h2.plan
        $('.price-item h2.plan').addClass('light');
        // section h2, section h3, section h4
        $('section h2, section h3, section h4').addClass('light');
        // .blog-item .category
        $('.blog-item .category').addClass('light');
        // .blog-item .category
        $('.blog-item .category').addClass('light');
        // .blog-item .details h4.title a
        $('.blog-item .details h4.title a').addClass('light');

        localStorage.setItem('theme', 'light');

        // transform translateX(30px)
        $('#theme-icon .moon-sun').css('transform', 'translateX(0px)');
      } else {
        $('body').addClass('dark');

        $('.service-box').addClass('dark');

        $('.light').each(function() {
          $(this).removeClass('light');
        });

        localStorage.setItem('theme', 'dark');

        // transform translateX(30px)
        $('#theme-icon .moon-sun').css('transform', 'translateX(30px)');
      }

    });

    
    /*=========================================================================
                Video Play
    =========================================================================*/
    let audio = new Audio('assets/audios/self-intro.mp3');

    // 获取要点击的元素
    const playButton = document.getElementById('about-introduce');

    // 绑定点击事件
    playButton.addEventListener('click', () => {
        // 如果音频正在播放，暂停并重置
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        }

        // 重新播放音频
        audio.play().catch(error => {
            console.log("Error playing audio:", error);
        });
    });

});

$(function(){
    "use strict";

    /*=========================================================================
            Mobile Menu Toggle
    =========================================================================*/
    $('.menu-icon button').on( 'click', function() {
        $('header.desktop-header-1, main.content, header.mobile-header-1').toggleClass('open');
    });

    $('main.content').on( 'click', function() {
        $('header.desktop-header-1, main.content, header.mobile-header-1').removeClass('open');
    });

    $('.vertical-menu li a').on( 'click', function() {
        $('header.desktop-header-1, main.content, header.mobile-header-1').removeClass('open');
    });

    $('.menu-icon button').on( 'click', function() {
        $('header.desktop-header-2, main.content-2, header.mobile-header-2').toggleClass('open');
    });

    $('main.content-2').on( 'click', function() {
        $('header.desktop-header-2, main.content-2, header.mobile-header-2').removeClass('open');
    });

    $('.vertical-menu li a').on( 'click', function() {
        $('header.desktop-header-2, main.content-2, header.mobile-header-2').removeClass('open');
    });

    /*=========================================================================
     One Page Scroll with jQuery
     =========================================================================*/
    $('a[href^="#"]:not([href="#"]').on('click', function(event) {
      var $anchor = $(this);
      $('html, body').stop().animate({
        scrollTop: $($anchor.attr('href')).offset().top
      }, 800, 'easeInOutQuad');
      event.preventDefault();
    });

    /*=========================================================================
     Parallax layers
     =========================================================================*/
     if ($('.parallax').length > 0) { 
      var scene = $('.parallax').get(0);
      var parallax = new Parallax(scene, { 
        relativeInput: true,
      });
    }

    /*=========================================================================
     Add (nav-link) class to main menu.
     =========================================================================*/
    $('.vertical-menu li a').addClass('nav-link');

    /*=========================================================================
     Bootstrap Scrollspy
     =========================================================================*/
    $("body").scrollspy({ target: ".scrollspy"});

    /*=========================================================================
     Counterup JS for facts
     =========================================================================*/
    $('.count').counterUp({
      delay: 10,
      time: 2000
    });

    /*=========================================================================
     Progress bar animation with Waypoint JS
     =========================================================================*/
    if ($('.skill-item').length > 0) { 
      var waypoint = new Waypoint({
        element: document.getElementsByClassName('skill-item'),
        handler: function(direction) {
          
          $('.progress-bar').each(function() {
            var bar_value = $(this).attr('aria-valuenow') + '%';                
            $(this).animate({ width: bar_value }, { easing: 'linear' });
          });

          this.destroy()
        },
        offset: '50%'
      });
    }

    /*=========================================================================
     Spacer with Data Attribute
     =========================================================================*/
    var list = document.getElementsByClassName('spacer');

    for (var i = 0; i < list.length; i++) {
      var size = list[i].getAttribute('data-height');
      list[i].style.height = "" + size + "px";
    }

    /*=========================================================================
     Background Color with Data Attribute
     =========================================================================*/
     var list = document.getElementsByClassName('data-background');

     for (var i = 0; i < list.length; i++) {
       var color = list[i].getAttribute('data-color');
       list[i].style.backgroundColor = "" + color + "";
     }

    /*=========================================================================
            Main Menu
    =========================================================================*/
    $( ".submenu" ).before( '<i class="ion-md-add switch"></i>' );

    $(".vertical-menu li i.switch").on( 'click', function() {
        var $submenu = $(this).next(".submenu");
        $submenu.slideToggle(300);
        $submenu.parent().toggleClass("openmenu");
    });

    /*=========================================================================
            Chatbot Widget
    =========================================================================*/
    $('#chatbot-widget').on('click', function() {
        var $chatbotContent = $('.chatbot-content');

        // 判断当前状态，如果是隐藏状态，则显示，否则隐藏
        if ($chatbotContent.hasClass('show')) {
            $chatbotContent.removeClass('show');  // 隐藏
        } else {
            $chatbotContent.addClass('show');  // 展开
        }
    });

    /*=========================================================================
            Scroll to Top
    =========================================================================*/
    $(window).scroll(function() {
        if ($(this).scrollTop() >= 350) {        // If page is scrolled more than 50px
            $('#return-to-top').fadeIn(200);    // Fade in the arrow
        } else {
            $('#return-to-top').fadeOut(200);   // Else fade out the arrow
        }
    });
    $('#return-to-top').on('click', function(event) {     // When arrow is clicked
        event.preventDefault();
        $('body,html').animate({
            scrollTop : 0                       // Scroll to top of body
        }, 400);
    });

});
