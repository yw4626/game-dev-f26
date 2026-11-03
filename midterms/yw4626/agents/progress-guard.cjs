'use strict';
// Public observations only. Detects repeated service/navigation states, not combat turns.
class ProgressGuard {
  constructor({repetitionWindow=128,repetitionWarnAt=4,repetitionLimit=16}={}){this.window=repetitionWindow;this.warnAt=repetitionWarnAt;this.limit=repetitionLimit;this.states=[];}
  inspect(o){
    if(['battle','levelup','won','lost'].includes(o.phase)){this.states.push(null);this.trim();return null;}
    const key=JSON.stringify([o.floor,o.phase,o.position,o.health,o.gold,o.level,o.progress?.wins,o.progress?.kills,o.deck.map(c=>[c.id,c.key,c.gemSlots,c.gems]),o.gems?.selected||null]);
    this.states.push(key);this.trim();const count=this.states.filter(x=>x===key).length;
    return {repeats:count,stalled:count>=this.limit,...(count>=this.warnAt?{notice:'Repeated equivalent public state. Avoid deferred/unavailable services and completed rooms. Follow the map objective or choose another unfinished marker; do not cancel and immediately revisit the same service.'}:{})};
  }
  trim(){if(this.states.length>this.window)this.states.splice(0,this.states.length-this.window);}
}
module.exports={ProgressGuard};
