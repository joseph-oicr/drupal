/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal, debounce, displace) {
  var minDisplaceWidth = 768;

  var edge = document.documentElement.dir === 'rtl' ? 'left' : 'right';

  var $mainCanvasWrapper = $('[data-off-canvas-main-canvas]');

  function resetSize(event) {
    var offsets = displace.offsets;
    var $element = event.data.$element;
    var $widget = $element.dialog('widget');
    var $elementScroll = $element.scrollTop();

    var adjustedOptions = {
      position: {
        my: edge + ' top',
        at: edge + ' top' + (offsets.top !== 0 ? '+' + offsets.top : ''),
        of: window
      }
    };

    $widget.css({
      position: 'fixed',
      height: $(window).height() - (offsets.top + offsets.bottom) + 'px'
    });

    $element.dialog('option', adjustedOptions).trigger('dialogContentResize.off-canvas');

    $element.scrollTop($elementScroll);
  }

  function handleDialogResize(event) {
    var $element = event.data.$element;
    var $widget = $element.dialog('widget');

    var $offsets = $widget.find('> :not(#drupal-off-canvas, .ui-resizable-handle)');
    var offset = 0;
    var modalHeight = void 0;

    $element.css({ height: 'auto' });
    modalHeight = $widget.height();
    $offsets.each(function () {
      offset += $(this).outerHeight();
    });

    var scrollOffset = $element.outerHeight() - $element.height();
    $element.height(modalHeight - offset - scrollOffset);
  }

  function bodyPadding(event) {
    if ($('body').outerWidth() < minDisplaceWidth) {
      return;
    }
    var $element = event.data.$element;
    var $widget = $element.dialog('widget');

    var width = $widget.outerWidth();
    var mainCanvasPadding = $mainCanvasWrapper.css('padding-' + edge);
    if (width !== mainCanvasPadding) {
      $mainCanvasWrapper.css('padding-' + edge, width + 'px');
      $widget.attr('data-offset-' + edge, width);
      displace();
    }
  }

  Drupal.behaviors.offCanvasEvents = {
    attach: function attach() {
      $(window).once('off-canvas').on({
        'dialog:aftercreate': function dialogAftercreate(event, dialog, $element, settings) {
          if ($element.is('#drupal-off-canvas')) {
            var eventData = { settings: settings, $element: $element };
            $('.ui-dialog-off-canvas, .ui-dialog-off-canvas .ui-dialog-titlebar').toggleClass('ui-dialog-empty-title', !settings.title);

            $element.on('dialogresize.off-canvas', eventData, debounce(bodyPadding, 100)).on('dialogContentResize.off-canvas', eventData, handleDialogResize).on('dialogContentResize.off-canvas', eventData, debounce(bodyPadding, 100)).trigger('dialogresize.off-canvas');

            $element.dialog('widget').attr('data-offset-' + edge, '');

            $(window).on('resize.off-canvas scroll.off-canvas', eventData, debounce(resetSize, 100)).trigger('resize.off-canvas');
          }
        },
        'dialog:beforecreate': function dialogBeforecreate(event, dialog, $element, settings) {
          if ($element.is('#drupal-off-canvas')) {
            $('body').addClass('js-tray-open');

            settings.position = {
              my: 'left top',
              at: edge + ' top',
              of: window
            };
            settings.dialogClass += ' ui-dialog-off-canvas';

            settings.height = $(window).height();
          }
        },
        'dialog:beforeclose': function dialogBeforeclose(event, dialog, $element) {
          if ($element.is('#drupal-off-canvas')) {
            $('body').removeClass('js-tray-open');

            $(document).off('.off-canvas');
            $(window).off('.off-canvas');
            $mainCanvasWrapper.css('padding-' + edge, 0);
          }
        }
      });
    }
  };
})(jQuery, Drupal, Drupal.debounce, Drupal.displace);