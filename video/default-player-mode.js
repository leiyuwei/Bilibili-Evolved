const playerModes = [
    {
        name: "常规",
        action: () => { },
    },
    {
        name: "宽屏",
        action: () =>
        {
            $(".bilibili-player-video-btn-widescreen").click();
            document.querySelector("#bofqi").scrollIntoView({ behavior: "smooth" });
        },
    },
    {
        name: "网页全屏",
        action: () =>
        {
            $(".bilibili-player-video-web-fullscreen").click();
        },
    },
    // {
    //     name: "全屏",
    // },
];
let lightOff = () => { };
async function initLightOff()
{
    if (settings.autoLightOff)
    {
        await SpinQuery.unsafeJquery();
        const settingsButton = await SpinQuery.any(() => unsafeWindow.$(".bilibili-player-video-btn-setting"));
        if (!settingsButton)
        {
            return;
        }
        settingsButton.mouseover().mouseout();
        lightOff = () =>
        {
            SpinQuery.any(
                () => $(".bilibili-player-video-btn-setting-panel-others-content-lightoff .bui-checkbox-input"),
                checkbox =>
                {
                    const lightOffCheckBox = checkbox[0];
                    lightOffCheckBox.checked = true;
                    raiseEvent(lightOffCheckBox, "change");
                }
            );
        };
    }
}
async function main()
{
    await initLightOff();
    await SpinQuery.condition(
        () => $(".bilibili-player-video,.bilibili-player-video-btn-start,.bilibili-player-area"),
        it => it.length === 3 && $("video").length > 0 && $("video").prop("duration"));

    const video = document.querySelector("video");
    if (!video)
    {
        return;
    }
    const info = playerModes.find(it => it.name === settings.defaultPlayerMode);
    if (info.name === "全屏")
    {
        const unsafe$ = await SpinQuery.unsafeJquery();
        const playButton = document.querySelector(".bilibili-player-video-btn-start");
        const playerButtonClick = () =>
        {
            const events = unsafe$(".bilibili-player-video-btn-fullscreen").data("events");
            if (events.click && events.click[0] && events.click[0].handler)
            {
                const handler = unsafe$(".bilibili-player-video-btn-fullscreen").data("events").click[0].handler;
                console.log(handler);
                handler();
            }

            playButton.removeEventListener("click", playerButtonClick);
        };
        playButton.addEventListener("click", playerButtonClick);
    }
    else
    {
        const onplay = () =>
        {
            if (info && $("#bilibiliPlayer[class*=mode-]").length === 0)
            {
                info.action();
            }
            lightOff();
            if (settings.applyPlayerModeOnPlay)
            {
                video.removeEventListener("play", onplay);
            }
        };
        if (settings.applyPlayerModeOnPlay)
        {
            video.addEventListener("play", onplay);
        }
        else
        {
            onplay();
        }
    }
}
if (Observer.videoChange)
{
    Observer.videoChange(main);
}
else
{ Observer.childList("#bofqi", () => main()); }