/**
 * Created by jungwon.an on 2016-12-01.
 */
(function (angular, window) {
    'use strict';

    angular.module('kw.tooltip', [])
        .directive('tooltip', ['$q', '$document', '$compile', '$sce', '$templateRequest', function (
            $q,
            $document,
            $compile,
            $sce,
            $templateRequest
        ) {
            // ttText
            // ttOptions
            // ttScopeModel
            // ttDisable

            var /*Object<String,Number>*/ typeList = {
                LEFT: 1,
                RIGHT: 2,
                TOP: 3,
                BOTTOM: 4
            };

            var /*Array<Function>*/ tooltipQueue = [];

            function calcElementPosition(/*Number*/type, /*Number*/padding, /*Object*/srcRect, /*Object=undefined*/targetRect) {
                var /*Number*/ x;
                var /*Number*/ y;

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

                            if (y + targetRect.height >= window.innerHeight)
                                y -= (y + targetRect.height + padding) - window.innerHeight;

                            break;
                        case typeList.RIGHT:
                            y -= (targetRect.height - srcRect.height) / 2;

                            if (x + targetRect.width >= window.innerWidth)
                                x = srcRect.left - targetRect.width - padding;

                            if (y < padding)
                                y = padding;

                            if (y + targetRect.height >= window.innerHeight)
                                y -= (y + targetRect.height + padding) - window.innerHeight;

                            break;
                        case typeList.BOTTOM:
                            x -= (targetRect.width - srcRect.width) / 2;

                            if (x < padding)
                                x = padding;

                            if (x + targetRect.width >= window.innerWidth)
                                x += (window.innerWidth - x - targetRect.width - padding);

                            if (y + targetRect.height >= window.innerHeight)
                                y = srcRect.top - targetRect.height - padding;

                            break;
                        default:
                            x -= (targetRect.width - srcRect.width) / 2;
                            y -= targetRect.height;

                            if (x < padding)
                                x = padding;

                            if (x + targetRect.width >= window.innerWidth)
                                x += (window.innerWidth - x - targetRect.width - padding);

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
                        useHTML: false
                    };

                    var /*Boolean*/ isMouseOver = false;
                    var /*Number*/ waitTimer = null;
                    var /*String*/ templateSrc = null;
                    var /*Number*/ type = typeList[$attr['ttType']] || typeList.TOP;

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

                        // Element Init
                        var /*Object*/ elementRect = $element[0].getBoundingClientRect();
                        tooltipDOM = angular.element(templateSrc);
                        angular.element(document.body).append(tooltipDOM);

                        // Bind Scope
                        $scope.model = getEvalAttr($attr['ttScopeModel']);

                        $compile(tooltipDOM)($scope);
                        SafeApply($scope);

                        if (tooltipDOM) {
                            var /*Object*/ position = calcElementPosition(type, options.padding, elementRect, tooltipDOM[0].getBoundingClientRect());
                            tooltipDOM[0].style.left = position.x.toString() + 'px';
                            tooltipDOM[0].style.top = position.y.toString() + 'px';

                            setTimeout(function () {
                                try {
                                    if (!tooltipDOM)
                                        return;

                                    var /*String*/ secondString = (options.animationTime / 1000.0).toFixed(2) + 's';
                                    tooltipDOM[0].style['transition'] = 'all ' + secondString;
                                    tooltipDOM[0].style['-o-transition'] = 'all ' + secondString;
                                    tooltipDOM[0].style['-ms-transition'] = 'all ' + secondString;
                                    tooltipDOM[0].style['-moz-transition'] = 'all ' + secondString;
                                    tooltipDOM[0].style['-webkit-transition'] = 'all ' + secondString;
                                    tooltipDOM[0].style.opacity = 1;
                                    tooltipDOM[0].style['z-index'] = def.zorder.Tooltip;

                                    position = calcElementPosition(type, options.padding, elementRect, tooltipDOM[0].getBoundingClientRect());
                                    tooltipDOM[0].style.left = position.x.toString() + 'px';
                                    tooltipDOM[0].style.top = position.y.toString() + 'px';
                                } catch (e) {}
                            }, 0);
                        }
                    }
                    function closeMenu() {
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
                                useHTML: false
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