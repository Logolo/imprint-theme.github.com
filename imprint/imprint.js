Imprint = {
  scrollTargets: [],
  hotTargetIndex: 0,
  scrollBox: null,
  speedCo: 0.9,
  effectOffset: 250, // equal to the Y translation of the bubbles
  
  setScrollTops: function() {
    var
      winHeight = (typeof window.innerHeight != 'undefined' ? window.innerHeight : document.body.offsetHeight)
      heatOffset = winHeight * 0.5 + this.effectOffset
    
    $.each(this.scrollTargets, function(i) {
      var
        $target = this[0],
        targetTop = $target.offset().top

      if ($target.parent("ul.bubbles").length)
        targetTop -= heatOffset

      Imprint.scrollTargets[i][1] = targetTop
    })
  },
  
  revealBubble: function() {
    var $b = Imprint.scrollTargets[Imprint.hotTargetIndex][0]
    if ($b.length) {
      $("ul.bubbles li.hot").addClass("heated").removeClass("hot")
      $b.addClass("hot") 
    }
  },
  
  move: function(dir) {
    var
      currentTop = this.scrollBox.scrollTop(),
      $target,
      $parent,
      targetTop,
      duration,
      winHeight = (typeof window.innerHeight != 'undefined' ? window.innerHeight : document.body.offsetHeight)
      
    this.hotTargetIndex = Math.min(Math.max(0, this.hotTargetIndex + dir), this.scrollTargets.length - 1)
    $target = this.scrollTargets[this.hotTargetIndex][0]
    $parent = $target.parent("ul").parent()
    targetTop = ($parent.length ? $parent : $target).offset().top

    if (targetTop > currentTop && targetTop - currentTop < winHeight * 0.1) 
      targetTop = currentTop
    
    if ($target.offset().top + $target.height() - this.effectOffset > targetTop + winHeight)
      targetTop = this.scrollTargets[this.hotTargetIndex][1]
    
    duration = Math.abs(Math.round((targetTop - currentTop) * this.speedCo))

    this.scrollBox.addClass("autopilot")
    this.scrollBox.animate({ scrollTop: targetTop }, duration)
    setTimeout(function() {
      Imprint.revealBubble()
    }, Math.floor(duration * 0.3))
    setTimeout(function() {
      Imprint.scrollBox.removeClass("autopilot")
    }, duration + 100)
  },
  
  init: function() {
    var $body = $("body")
    window.scrollTo(0, 1)
    this.scrollBox = ($body.scrollTop() === 1 ? $body : $("html"))
    window.scrollTo(0, 0)
    
    if (navigator.userAgent.indexOf("WebKit") === -1)
      this.effectOffset = 0
      // oops browser sniffing
      
    this.scrollTargets = $.map($("#cover, #intro, ul.bubbles > li, #outro"), function(el){ return [[$(el), 0]] })
    Imprint.setScrollTops()

    $(window).trigger("resize")
    $body.addClass("ready")
    setTimeout(function() {
      $(window).trigger("resize")
    }, 500)
  }
}

$(function() {  
  $(window)
    .bind("keydown", function(e) {
      var dir = 0
        
      if (e.keyCode == 32) { // space
        dir = (e.shiftKey ? -1 : 1)
      } else {
        switch(e.keyCode) {
          case 34: // page down; keep falling through
          case 40: // down
            dir = 1
            break
            
          case 33: // page up; keep falling through
          case 38: // up
            dir = -1
            break
        }
      }
      
      if (dir !== 0) {
        Imprint.move(dir)
        e.preventDefault()
        return false
      }
    })
    .bind("resize", function() {
      var winHeight = (typeof window.innerHeight != 'undefined' ? window.innerHeight : document.body.offsetHeight)
      $(".stretch").each(function() { $(this).css("height", winHeight) })
      Imprint.setScrollTops()
      $(this).trigger("scroll")
    })
    .bind("scroll", function(e) {
      if (!Imprint.scrollBox || Imprint.scrollBox.hasClass("autopilot")) return;
      
      var
        top = Imprint.scrollBox.scrollTop(),
        hotIndex = -1
        
      $.each(Imprint.scrollTargets, function(index) {
        if (this[1] > top) return false // break the loop
        hotIndex = index
      })
            
      if (hotIndex >= 0 && Imprint.hotTargetIndex !== hotIndex) {
        Imprint.hotTargetIndex = hotIndex
        Imprint.revealBubble()
      }
    })    
    // .bind("hashchange", function() {
    //   if (location.hash) Imprint.speedCo = parseFloat(window.location.hash.substring(1), 10)
    // })
    // .trigger("hashchange")
  
  Imprint.init()
})

l = function() { console.log.apply(console, arguments) }
