/*
 * Auto-tune: score how readable the digits in a user-drawn box are, so test images
 * taken with different camera settings can be compared.
 */
var AutoTune = (function () {
    /* How readable is the box? Spread between digits and their background, minus
       burnt-out pixels in and around the box. Higher is better, for comparing
       shots of the same scene.

       band: {cx, cy, length, width} = centre and size of the box in the raw image,
       axis: direction of the box's long side in the raw image, in degrees. */
    function scoreReadability(imageData, band, axis) {
        var c = Math.cos(axis * Math.PI / 180), s = Math.sin(axis * Math.PI / 180);
        var values = [], clipped = 0, total = 0, d = imageData.data;

        for (var v = -band.width; v <= band.width; v++) {
            for (var u = -band.length / 2; u <= band.length / 2; u++) {
                var x = Math.round(band.cx + u * c - v * s), y = Math.round(band.cy + u * s + v * c);
                if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) continue;
                var p = (y * imageData.width + x) * 4;
                var g = 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2];
                total++;
                if (g >= 250) clipped++;
                if (Math.abs(v) <= band.width * 0.4) values.push(g);
            }
        }
        if (!values.length) return -1;

        values.sort(function (a, b) { return a - b; });
        var dark = values[Math.floor(values.length * 0.2)], bright = values[Math.floor(values.length * 0.98)];
        return (bright - dark) / 255 - clipped / total;
    }

    return { scoreReadability: scoreReadability };
})();
