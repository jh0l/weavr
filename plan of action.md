## TODO

1. [ ] start with circle canvas (try to allow for any type of convex hull)
    1. [x] load image into canvas
    2. [x] get image dimensions
    3. [x] append d3 svg of image dimensions
    4. [x] get list of `l` points around svg
    5. [x] for `n` iterations
        1. [x] get size `o` list of random cross sections of points
            1. [x] iterate list finding darkest average line
                1. [ ] use bresenham's algo to average line pixel brightness
        2. [ ] draw line for darkest average cross section
        3. [ ] add white to image where new cross section is
2. [ ] improvements
    1. [ ] controls for `l`, `n`, `o`
    2. [ ] custom image
    3. [ ] resize image
    4. [ ] use RGB strings, measure RGB channels as seperate lines, color line
           RGB darkest
    5. [ ] draw custom SVG shape

## references

https://jsfiddle.net/0u8nxoc1/
https://stackoverflow.com/questions/25277023/complete-solution-for-drawing-1-pixel-line-on-html5-canvas
https://jsfiddle.net/m1erickson/3j7hpng0/
