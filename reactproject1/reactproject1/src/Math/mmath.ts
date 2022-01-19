import { Vec2D, Vector2D } from "./Vec2D";

export class mmath {
    public static CURVE_APPROX_T_STEP = 0.02;
}

export function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

export function rad2deg(rad: number): number {
    return rad * (180 / Math.PI);
}

export function clampPoint(point: Vector2D, min: Vector2D, max: Vector2D): boolean {
    return clamp(point.x, min.x, max.x) || clamp(point.y, min.y, max.y);
}

export function lerp(num1: number, num2: number, time: number): number {
    return num1 * (1 - time) + num2 * time;
}

export function clamp(value: number, min: number, max: number): boolean {
    let clamped = false;
    if (value < min) {
        value = min;
        clamped = true;
    }
    if (value > max) {
        value = max;
        clamped = true;
    }
    return clamped;
}

export function pointToAngle(center: Vector2D, point: Vector2D): number {
    var angle = Math.atan2(point.y - center.y, point.x - center.x);
    if (angle < 0.0) {
        angle += (Math.PI * 2);
    }
    return angle;
}

export function computeCenter(start: Vector2D, radiusX: number, radiusY: number, angle: number): Vector2D {
    const t = Math.atan2((radiusX * Math.sin(angle)), (radiusY * Math.cos(angle)));
    return new Vec2D(start.x - radiusX * Math.cos(t), start.y - radiusY * Math.sin(t));
}

export function computeEndPoint(center: Vector2D, radiusX: number, radiusY: number, angle: number): Vector2D {
    let sSin = Math.sin(angle);
    let sCos = Math.cos(angle);
    return {
        x: center.x + radiusX * sCos,
        y: center.y + radiusY * sSin
    };
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

export function pointInCircle(point: Vector2D, center: Vector2D, radius: number): boolean {
    return (point.x - center.x) * (point.x - center.x) + (point.y - center.y) * (point.y - center.y) < radius * radius;
}

export function pointInRect(point: Vector2D, rect: DOMRect | undefined): boolean {
    return rect && point.x >= rect.x &&
            point.y >= rect.y &&
            point.x < rect.x + rect.width &&
            point.y < rect.y + rect.height ? true : false;
}