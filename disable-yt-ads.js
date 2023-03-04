// ==UserScript==
// @name         Disable yt ads
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  auto skip video ads and close banners + shortcut
// @author       You
// @match        https://www.youtube.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const ADS_CONTAINER = "#movie_player > div.video-ads.ytp-ad-module";
    const SKIP_AD_BTN = "button.ytp-ad-skip-button";
    const CLOSE_BANNER_BTN = "button.ytp-ad-overlay-close-button";

    const skipAd = () => {
        const skipAdButton = document.querySelector(SKIP_AD_BTN);
        if (skipAdButton) {
            skipAdButton.click();
            console.info("skipping video ad");
        }

        const closeAdBannerButton = document.querySelector(CLOSE_BANNER_BTN);
        if (closeAdBannerButton) {
            closeAdBannerButton.click();
            console.info("closing ad banner");
        }
    };

    const setupAdsObserver = () => {
        const elem = document.querySelector(ADS_CONTAINER);
        if (!elem) {
            console.info("container not found, waiting for next trigger...");
            return null;
        }

        console.info("seting up ads observer");
        const observer = new MutationObserver(skipAd);
        observer.observe(elem, {childList: true, subtree: true});

        return observer;
    };

    const setupBodyObserver = () => {
        const bodyObserver = new MutationObserver(() => {
            if (!isOnWatchPage()) {
                if (!wasOnWatchPageBefore) return;

                wasOnWatchPageBefore = false;
                console.info("not on watch page, removing ads observer");
                adsObserver?.disconnect();
                adsObserver = null;
                return;
            }

            if (wasOnWatchPageBefore) return;

            wasOnWatchPageBefore = true;
            console.info("now on watch page, setting up ads observer");

            adsObserver = setupAdsObserver();
        });
        bodyObserver.observe(document.body, {subtree: true, childList: true});

        return bodyObserver;
    };

    const isOnWatchPage = () => /watch/.test(location.href);

    let wasOnWatchPageBefore = isOnWatchPage();
    let adsObserver = setupAdsObserver();
    const bodyObserver = setupBodyObserver();

    document.addEventListener("keydown", e => {
        // check for the key `S`
        if (e.key.toLowerCase() != "s") return;

        if (!isOnWatchPage()) return;

        skipAd();
        if (!adsObserver) adsObserver = setupAdsObserver();
    });
})();
