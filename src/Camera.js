import { THREE } from 'expo-three';

export default class Camera extends THREE.PerspectiveCamera {
    constructor(target) {
        super();
        this.target = target;
    }

    lookAt(x, y, z) {
        super.lookAt(x, y, z);
        if (x.isVector3) {
            this.target.copy(x);
        } else {
            this.target.set(x, y, z);
        }
    }
}
