import { Vec2, Vec3, Vector3 } from "./Vector";

export class mmath {
    public static CURVE_APPROX_T_STEP = 0.02;
}

export function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

export function rad2deg(rad: number): number {
    return rad * (180 / Math.PI);
}

export function clampPoint(point: Vec3, min: Vec3, max: Vec3): Vec3 {
    return Vector3.clamp(Vector3.clone(point), min, max);
}

export function lerp(num1: number, num2: number, time: number): number {
    return num1 * (1 - time) + num2 * time;
}

export function clamp(value: number, min: number, max: number): number {
    if (value < min) {
        value = min;
    }
    if (value > max) {
        value = max;
    }
    return value;
}
export function map(value: number, low1: number, low2: number, high1: number, high2:number) {
    return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
}
export function pointToAngle(center: Vec2, point: Vec2): number {
    var angle = Math.atan2(point[1] - center[1], point[0] - center[0]);
    if (angle < 0.0) {
        angle += (Math.PI * 2);
    }
    return angle;
}

export function computeCenter(start: Vec2, radiusX: number, radiusY: number, angle: number): Vec2 {
    const t = Math.atan2((radiusX * Math.sin(angle)), (radiusY * Math.cos(angle)));
    return [start[0] - radiusX * Math.cos(t), start[1] - radiusY * Math.sin(t)];
}

export function computeEndPoint(center: Vec2, radiusX: number, radiusY: number, angle: number): Vec2 {
    let sSin = Math.sin(angle);
    let sCos = Math.cos(angle);
    return [
        center[0] + radiusX * sCos,
        center[1] + radiusY * sSin
    ];
}

export function normalize360Radians(angle: number): number {
    let norm = angle;
    if (norm >= Math.PI * 2) {
        norm -= Math.PI * 2;
    }
    if (norm <= 0.0) {
        norm += Math.PI * 2;
    }
    if (norm === Math.PI * 2)
        norm = 0.0;
    return norm;
}

export function pointInCircle(point: Vec2, center: Vec2, radius: number): boolean {
    return (point[0] - center[0]) * (point[0] - center[0]) + (point[1] - center[1]) * (point[1] - center[1]) < radius * radius;
}

export function pointInRect(point: Vec2, rect: DOMRect | undefined): boolean {
    return rect && point[0] >= rect.x &&
            point[1] >= rect.y &&
            point[0] < rect.x + rect.width &&
            point[1] < rect.y + rect.height ? true : false;
}