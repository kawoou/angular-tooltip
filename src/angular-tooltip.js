/**
 * Created by jungwon.an on 2016-12-01.
 */
(function (angular, window) {
    'use strict';

    var /*Object<String,Number>*/ typeList = {
        LEFT: 1,
        RIGHT: 2,
        TOP: 3,
        BOTTOM: 4
    };
    var /*Array<Function>*/ tooltipQueue = [];

    function getScreenWidth() {
        return window.innerHeight || document.documentElement.clientHeight;
    }
    function getScreenHeight() {
        return window.innerHeight || document.documentElement.clientHeight;
    }

    angular.module('kw.tooltip', [])
        .directive('tooltip', ['$q', '$document', '$compile', '$sce', '$timeout', '$templateRequest', function (
            $q,
            $document,
            $compile,
            $sce,
            $timeout,
            $templateRequest
        ) {
            // ttText
            // ttOptions
            // ttScopeModel
            // ttDisable

            function calcElementPosition(/*Number*/type, /*Number*/padding, /*ClientRect*/srcRect, /*ClientRect=undefined*/targetRect) {
                var /*Number*/ x;
                var /*Number*/ y;
                var /*Number*/ screenHeight = getScreenHeight();

                switch (type) {
                    case typeList.LEFT:
                        x = srcRect.left - padding;
                        y = srcRect.top;
                        break;
                    case typeList.RIGHT:
                        x = srcRect.right + padding;
                        y = srcRect.top;
                        break;
                    case typeList.BOTTOM:
                        x = srcRect.left;
                        y = srcRect.bottom + padding;
                        break;
                    default:
                        x = srcRect.left;
                        y = srcRect.top - padding;
                }

                if (targetRect) {
                    switch (type) {
                        case typeList.LEFT:
                            x -= targetRect.width;
                            y -= (targetRect.height - srcRect.height) / 2;

                            if (x < padding)
                                x = srcRect.right + padding;

                            if (y < padding)
                                y = padding;

                            if (y + targetRect.height >= screenHeight)
                                y -= (y + targetRect.height + padding) - screenHeight;

                            break;
                        case typeList.RIGHT:
                            y -= (targetRect.height - srcRect.height) / 2;

                            if (x + targetRect.width >= screenHeight)
                                x = srcRect.left - targetRect.width - padding;

                            if (y < padding)
                                y = padding;

                            if (y + targetRect.height >= screenHeight)
                                y -= (y + targetRect.height + padding) - screenHeight;

                            break;
                        case typeList.BOTTOM:
                            x -= (targetRect.width - srcRect.width) / 2;

                            if (x < padding)
                                x = padding;

                            if (x + targetRect.width >= screenHeight)
                                x += (screenHeight - x - targetRect.width - padding);

                            if (y + targetRect.height >= screenHeight)
                                y = srcRect.top - targetRect.height - padding;

                            break;
                        default:
                            x -= (targetRect.width - srcRect.width) / 2;
                            y -= targetRect.height;

                            if (x < padding)
                                x = padding;

                            if (x + targetRect.width >= screenHeight)
                                x += (screenHeight - x - targetRect.width - padding);

                            if (y < padding)
                                y = srcRect.bottom + padding;

                            break;
                    }
                }

                return {
                    x: x,
                    y: y
                };
            }

            return {
                restrict: 'EA',
                scope: {
                    tooltipText: '@ttText'
                },
                link: function ($scope, $element, $attr) {
                    /* Private */
                    var /*Object*/ options = {
                        waitTime: 250,
                        animationTime: 250,
                        padding: 5,
                        useHTML: false,
                        zIndex: 1000
                    };

                    var /*Boolean*/ isMouseOver = false;
                    var /*Number*/ waitTimer = null;
                    var /*String*/ templateSrc = null;
                    var /*Number*/ type = typeList[($attr['ttType'] || 'TOP').toUpperCase()];

                    var tooltipDOM = null;

                    // Getter
                    function SafeApply(/*Function=undefined*/callback) {
                        if (!$scope)
                            return;

                        var /*String*/ phase = $scope.$$phase || $document.scope().$$phase;

                        if (phase === '$apply' || phase === '$digest') {
                            if (callback)
                                $scope.$eval(callback);

                        } else {
                            if (callback)
                                $scope.$apply(callback);
                            else
                                $scope.$apply();
                        }
                    }
                    function getEvalAttr(/*String*/attrData, /*Object=undefined*/defaultValue) {
                        if (attrData)
                            return $scope.$eval(attrData) || $scope.$parent.$eval(attrData) || defaultValue;
                        else
                            return defaultValue;
                    }

                    // Method
                    function openMenu() {
                        // Golden-Path
                        if (waitTimer)
                            return;

                        if (!isMouseOver)
                            return;

                        if (!templateSrc)
                            return;

                        // Exceptions
                        tooltipQueue.forEach(function (/*Function*/removeCallback) {
                            if (removeCallback)
                                removeCallback();
                        });
                        tooltipQueue = [];
                        tooltipQueue.push(closeMenu);

                        // Element initialize
                        var /*ClientRect*/ elementRect = $element[0].getBoundingClientRect();
                        tooltipDOM = angular.element(templateSrc);

                        if (tooltipDOM) {
                            // Append element
                            angular.element(document.body).append(tooltipDOM);

                            // Bind scope
                            $scope.options = options;
                            $scope.model = getEvalAttr($attr['ttScopeModel']);

                            // Compile element
                            $compile(tooltipDOM)($scope);
                            SafeApply();

                            // Set start position
                            var /*Object*/ position = calcElementPosition(type, options.padding, elementRect, tooltipDOM[0].getBoundingClientRect());
                            tooltipDOM[0].style.left = position.x.toString() + 'px';
                            tooltipDOM[0].style.top = position.y.toString() + 'px';

                            // Transition
                            $timeout(function () {
                                try {
                                    if (!tooltipDOM)
                                        return;

                                    var /*String*/ transitionText = 'all ' + (options.animationTime / 1000.0).toFixed(2) + 's';
                                    tooltipDOM[0].style['transition'] = transitionText;
                                    tooltipDOM[0].style['-o-transition'] = transitionText;
                                    tooltipDOM[0].style['-ms-transition'] = transitionText;
                                    tooltipDOM[0].style['-moz-transition'] = transitionText;
                                    tooltipDOM[0].style['-webkit-transition'] = transitionText;
                                    tooltipDOM[0].style.opacity = 1;
                                    tooltipDOM[0].style['z-index'] = options.zIndex;

                                    position = calcElementPosition(type, options.padding, elementRect, tooltipDOM[0].getBoundingClientRect());
                                    tooltipDOM[0].style.left = position.x.toString() + 'px';
                                    tooltipDOM[0].style.top = position.y.toString() + 'px';
                                } catch (e) {
                                    console.error('Not found Tooltip element!');
                                    console.error(e);
                                }
                            });
                        } else {
                            console.error('Failed to create Tooltip element!');
                        }
                    }
                    function closeMenu() {
                        // Golden-Path
                        if (!tooltipDOM)
                            return;

                        var tempDOM = tooltipDOM;
                        tooltipDOM = null;

                        if (tempDOM) {
                            tempDOM[0].style.opacity = 0;

                            setTimeout(function () {
                                tempDOM.remove();
                                tempDOM = null;
                            }, options.animationTime);
                        }
                    }
                    function /*Promise*/ loadTemplate(/*String*/path) {
                        return $q(function (resolve, reject) {
                            if (!path) {
                                templateSrc = '<div style="opacity:0;position:fixed">' +
                                    '<div style="border:1px solid #e0e7e8;background:white;padding:6px 6px;margin:0;">' +
                                        (options.useHTML ?
                                            '<p style="padding:0;margin:0;font-size:14px;line-height:14px;" ng-bind-html="trustHtml(tooltipText)"></p>' :
                                            '<p style="padding:0;margin:0;font-size:14px;line-height:14px;">{{ tooltipText }}</p>'
                                        ) +
                                    '</div>' +
                                '</div>';
                                resolve();
                                return;
                            }

                            $templateRequest(path)
                                .then(function SUCCESS(/*String*/html) {
                                    templateSrc = '<div style="opacity:0;position:fixed">' + html + '</div>';
                                    resolve();
                                }, function ERROR() {
                                    reject();
                                });
                        });
                    }

                    function init() {
                        if ($attr['tooltip'] && $attr['tooltip'].length > 0) {
                            loadTemplate($attr['tooltip'])
                                .then(function SUCCESS() {
                                    openMenu();
                                }, function ERROR() {
                                    loadTemplate(null).finally(openMenu);
                                });
                        } else {
                            loadTemplate(null).finally(openMenu);
                        }
                    }

                    /* Public */
                    $scope.dismiss = closeMenu;
                    $scope.trustHtml = function (/*String*/html) {
                        return $sce.trustAsHtml(html);
                    };

                    /* Event Handler */
                    // Mouse Over/Out
                    $element.$on('mouseover', function () {
                        if (!tooltipDOM)
                            return;

                        if (waitTimer)
                            return;

                        if (getEvalAttr($attr['ttDisable'], false))
                            return;

                        isMouseOver = true;
                        waitTimer = setTimeout(function () {
                            waitTimer = null;
                            openMenu();
                        }, options.waitTime);
                    });
                    $element.$on('mouseout', function () {
                        isMouseOver = false;

                        if (waitTimer) {
                            clearTimeout(waitTimer);
                            waitTimer = null;
                        }
                        closeMenu();
                    });

                    // Update option
                    if ($attr['ttOptions']) {
                        $scope.$on($attr['ttOptions'], function () {
                            angular.merge(options, getEvalAttr($attr['ttOptions']), {
                                waitTime: 250,
                                animationTime: 250,
                                padding: 5,
                                useHTML: false,
                                zIndex: 1000
                            });
                            init();
                        });
                    } else {
                        init();
                    }

                    if ($attr['ttScopeModel']) {
                        $scope.$on($attr['ttScopeModel'], function () {
                            init();
                        });
                    }

                    /* Lifecycle */
                    // Destroy
                    $scope.$on('$destroy', function () {
                        if (waitTimer) {
                            clearTimeout(waitTimer);
                            waitTimer = null;
                        }
                        closeMenu();
                    });
                }
            };

        }]);
}(angular, window));