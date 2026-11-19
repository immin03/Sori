/* Public endpoint only. Membership capabilities authorize private trip data.
   Loopback uses the isolated local API unless ?liveTrips=1 is explicitly set. */
(()=>{
 const loopback=['localhost','127.0.0.1'].includes(location.hostname);
 const liveTest=new URLSearchParams(location.search).get('liveTrips')==='1';
 window.SoriConfig=Object.freeze({tripsApiBase:loopback&&!liveTest?'/api':'https://sori-shared-trips-api.flutedsloth32.chatgpt.site/api'});
})();
