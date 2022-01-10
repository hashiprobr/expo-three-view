import { PerspectiveCamera } from 'three';

export default class Camera extends PerspectiveCamera {
    constructor(target) {
        super();
        this.target = target;
    }

    peekAt(x, y, z) {
        super.lookAt(x, y, z);
    }

    lookAt(x, y, z) {
        this.peekAt(x, y, z);
        if (x.isVector3) {
            this.target.copy(x);
        } else {
            this.target.set(x, y, z);
        }
    }
}
