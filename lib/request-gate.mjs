// Reject out-of-order provider responses whenever the underlying inputs change.
export function createRequestGate(){let generation=0;return {begin(){return ++generation;},invalidate(){generation++;},isCurrent(ticket){return ticket===generation;}};}
