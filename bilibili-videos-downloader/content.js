// ... existing code ...
function addDownloadButton() {
    if (document.getElementById('bili-download-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'bili-download-btn';
    btn.innerText = 'Download Video';
    btn.style.position = 'fixed';
    btn.style.top = '100px';
    btn.style.right = '30px';
    btn.style.zIndex = 9999;
    btn.onclick = async () => {
        if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
            alert('chrome.runtime is not defined');
            return;
        }
        const mediaData = await fetchMediaUrls();
        if (mediaData) {
            console.log('videoUrl:', mediaData.videoUrl);
            console.log('audioUrl:', mediaData.audioUrl);

            chrome.runtime.sendMessage({
                type: 'download',
                url: mediaData.videoUrl,
                filename: mediaData.filename + '_video.mp4'
            });

            alert('wait for 60s, then download audio');
        
            setTimeout(() => {
                chrome.runtime.sendMessage({
                    type: 'download',
                    url: mediaData.audioUrl,
                    filename: mediaData.filename + '_audio.mp3'
                });
            }, 60000);
        } else {
            alert('cannot find media urls');
        }
    };
    document.body.appendChild(btn);
}

async function fetchMediaUrls() {
    try {
        const scripts = document.getElementsByTagName('script');
        for (let script of scripts) {
            if (script.textContent.includes('window.__playinfo__=')) {
                const result = script.textContent.match(/window\.__playinfo__=({.*})/);
                if (result && result[1]) {
                    const info = JSON.parse(result[1]);
                    const videoUrl = info?.data?.dash?.video?.[0]?.baseUrl || info?.data?.dash?.video?.[0]?.base_url;
                    const audioUrl = info?.data?.dash?.audio?.[0]?.baseUrl || info?.data?.dash?.audio?.[0]?.base_url;
                    if (videoUrl && audioUrl) {
                        // 去除文件名中的非法字符
                        const safeTitle = document.title.replace(/[\\/:*?"<>|]/g, '');
                        return {
                            videoUrl,
                            audioUrl,
                            filename: safeTitle
                        };
                    }
                }
            }
        }
    } catch (e) {
        console.error('failed to parsed videos', e);
    }
    return null;
}

addDownloadButton();