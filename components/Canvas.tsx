import styles from '../styles/Home.module.css';
import {MutableRefObject, useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
const D3_TARGET = 'D3_TARGET_42060';
const COUNT = 300;
export default function Canvas() {
    const [weavr, setWeavr] = useState<Weavr>();
    const [hide, setHide] = useState(false);
    const [start, setStart] = useState(false);
    const [step, setStep] = useState(0);
    const canvas = useRef<HTMLCanvasElement>();
    const [canvasContainer, setCanvasContainer] = useState<CanvasContainer>();
    const target = useRef<HTMLDivElement>();
    useEffect(() => {
        if (canvas.current && !canvasContainer) {
            const c = new CanvasContainer(canvas.current, () =>
                setCanvasContainer(c)
            );
        }
    });
    useEffect(() => {
        if (canvasContainer && !weavr) {
            const weavr = new Weavr(
                {
                    width: canvasContainer.canvas.width,
                    height: canvasContainer.canvas.height,
                    count: COUNT,
                },
                canvasContainer
            );
            setWeavr(weavr);
        }
    }, [weavr, canvasContainer]);
    useEffect(() => {
        if (start && step < 1000) {
            weavr.start(() => setStep((s) => s + 1));
        }
    }, [start, step]);
    return (
        <div style={{position: 'relative'}}>
            <canvas ref={canvas} />
            <div
                ref={target}
                id={D3_TARGET}
                style={{
                    position: 'absolute',
                    top: 0,
                    display: hide ? 'none' : '',
                }}
            />
            {weavr && (
                <>
                    <button
                        className={styles.code}
                        onClick={() =>
                            start ? setStart(false) : setStart(true)
                        }
                    >
                        {start ? step : 'start'}
                    </button>
                    <button
                        className={styles.code}
                        onClick={() => {
                            weavr.reset();
                            canvasContainer.reset();
                        }}
                    >
                        reset
                    </button>
                    <button
                        className={styles.code}
                        onClick={() => setHide((h) => !h)}
                    >
                        {hide ? 'show' : 'hide'}
                    </button>
                </>
            )}
        </div>
    );
}

interface IPixel {
    v: number;
    points: number[][];
}

function pixel(
    v: number = Infinity,
    p0: number[] = [],
    p1: number[] = []
): IPixel {
    return {
        v,
        points: [p0, p1],
    };
}

interface IWeavrConfig {
    width: number;
    height: number;
    count: number;
}
class Weavr {
    target: string;
    config: IWeavrConfig;
    canvas: CanvasContainer;
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    circle: d3.Selection<SVGCircleElement, unknown, HTMLElement, any>;
    points: number[][];
    constructor(
        config: IWeavrConfig,
        canvas: CanvasContainer,
        target = D3_TARGET
    ) {
        console.log('Weavr loaded');
        this.target = target;
        this.config = config;
        this.canvas = canvas;
        this.paintSVG();
        this.paintCircle();
        this.paintPoints();
    }
    paintSVG() {
        // create svg element:
        this.svg = d3
            .select(`#${this.target}`)
            .append('svg')
            .attr('width', this.config.width)
            .attr('height', this.config.height);
    }
    paintCircle() {
        const middle = Math.min(this.config.width, this.config.height) / 2;
        // Add the path using this helper function
        this.circle = this.svg
            .append('circle')
            .attr('cx', middle)
            .attr('cy', middle)
            .attr('r', middle)
            .attr('fill', '#ffffff');
    }
    tracePoints() {
        const n = this.circle.node();
        const len = n.getTotalLength();
        const points = [];
        for (let i = 0; i < this.config.count; i++) {
            const p = n.getPointAtLength(len * (i / this.config.count));
            points.push([Math.floor(p.x), Math.floor(p.y)]);
        }
        this.points = points;
    }
    paintPoints() {
        this.tracePoints();
        this.svg
            .selectAll('.point')
            .data(this.points)
            .enter()
            .append('circle')
            .attr('r', 2)
            .attr('fill', 'blue')
            .attr('transform', (d) => `translate(${d})`);
    }
    paintLine(points: number[][]) {
        const [[x0, y0], [x1, y1]] = points;
        this.svg
            .append('line')
            .attr('x1', x0)
            .attr('y1', y0)
            .attr('x2', x1)
            .attr('y2', y1)
            .attr('stroke', 'black')
            .attr('stroke-width', '0.5');
    }
    start(callback: () => void, iterations = 5, samples = COUNT / 2) {
        let lines: IPixel[] = [];
        const rPoint = () =>
            this.points[Math.floor(Math.random() * this.config.count)];
        // for this many iterations
        for (let i = 0; i < iterations; i++) {
            // find darkest cross sectional line
            let darkest: IPixel = pixel();
            // from this many random samples
            for (let j = 0; j < samples; j++) {
                let len = 0; // line length
                let sum = 0; // average rgb brightness
                const [x0, y0] = rPoint();
                const [x1, y1] = rPoint();
                // use bresenham's algo
                this.canvas.bline([x0, y0, x1, y1], (x, y) => {
                    len++;
                    sum += this.canvas.getPixelBrightness(x, y);
                });
                const avg = sum / len;
                if (avg < darkest.v) {
                    darkest = pixel(avg, [x0, y0], [x1, y1]);
                }
            }
            // paint darkest on canvas
            this.canvas.paintLine(darkest.points);
            // paint all svg lines at end of process
            lines.push(darkest);
        }
        for (let line of lines) {
            this.paintLine(line.points);
        }
        callback();
    }
    reset() {
        this.svg.selectAll('line').remove();
    }
}

class CanvasContainer {
    img: HTMLImageElement;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    data: Uint8ClampedArray;
    constructor(canvas: HTMLCanvasElement, callback: () => void) {
        console.log('canvasContainter loaded');
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.loadImage(callback);
    }
    getImageData(width = this.canvas.width, height = this.canvas.height) {
        return this.ctx.getImageData(0, 0, width, height);
    }
    loadImage(callback: () => void) {
        const img = new Image();
        this.img = img;
        img.src = 'denholm.png';
        img.onload = () => {
            const c = this.canvas;
            img.width = 400;
            img.height = 400;
            c.width = img.width;
            c.height = img.height;
            img.onload = undefined;
            this.paintImage();
            callback();
        };
    }
    paintImage() {
        this.ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height);
        this.data = this.getImageData().data;
    }
    reset() {
        this.paintImage();
    }
    bline(
        [x0, y0, x1, y1]: number[],
        callback: (x: number, y: number) => void
    ) {
        var dx = Math.abs(x1 - x0),
            sx = x0 < x1 ? 1 : -1;
        var dy = Math.abs(y1 - y0),
            sy = y0 < y1 ? 1 : -1;
        var err = (dx > dy ? dx : -dy) / 2;
        while (true) {
            callback(x0, y0);
            if (x0 === x1 && y0 === y1) break;
            var e2 = err;
            if (e2 > -dx) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dy) {
                err += dx;
                y0 += sy;
            }
        }
    }
    /**
     * @param x
     * @param y
     * @returns cumulative brightness of RGBA subpixels
     */
    getPixelBrightness(x: number, y: number) {
        const n = (y * this.canvas.width + x) * 4;
        const p = this.data.slice(n, n + 4);
        const b = p.reduce((a, x) => a + x, 0);
        return b;
    }
    paintLine([[x0, y0], [x1, y1]]: number[][]) {
        this.ctx.lineWidth = 0.5;
        this.ctx.strokeStyle = 'rgb(255,255,255)';
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();
        this.data = this.getImageData().data;
    }
}
const randomColor = () => Math.floor(Math.random() * 16777215).toString(16);
