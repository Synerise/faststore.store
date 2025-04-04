
const ThirdPartyScripts = () => {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `
                    function onSyneriseLoad() {
                        SR.init({
                            trackerKey: "47f16347-5035-4d85-ab34-7a340428ebac",
                            plugin: "faststore"
                        }).then(function () {
                            SR.event.pageVisit().then(function () {
                                SR.dynamicContent.get();
                            });
                        });
                    }

                    (function(s,y,n,e,r,i,se){s["SyneriseObjectNamespace"]=r;s[r]=s[r]||[],
                        s[r]._t=1*new Date(),s[r]._i=0,s[r]._l=i;var z=y.createElement(n),
                        se=y.getElementsByTagName(n)[0];z.async=1;z.src=e;se.parentNode.insertBefore(z,se);
                        z.onload=z.onreadystatechange=function(){var rdy=z.readyState;
                            if(!rdy||/complete|loaded/.test(z.readyState)){s[i]();z.onload = null;
                                z.onreadystatechange=null;}};})(window,document,"script", "//web.snrbox.com/synerise-javascript-sdk.min.js", "SR", "onSyneriseLoad");
                    `,
            }}
        />
    )
}

export default ThirdPartyScripts
