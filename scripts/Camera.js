"use strict";

const Camera = {
    pan : new Vector(0, 0),
    zoom : 1,
    mode : 'S',
    targetPos : new Vector(0, 0),
    targetZoom : 1,
    /*
    Various modes:
    S: SET, pan = target position
    F: FADE, pan exponentially approaches target position
    */
    update(){
        switch (this.mode){
            case 'S':
                {
                    this.pan.copy(targetPos);
                } break;
            case 'F':
                {
                    this.pan.addSelf(this.targetPos.add(this.pan).divScalarSelf(2));
                } break;
            default:
                {
                throw TypeError("Camera.mode is not set to one of the options");
                } break;
        }
        this.zoom = (this.targetZoom + this.zoom) / 2;
    },
}
