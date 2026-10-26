// Routes one data input to one of sixteen outputs using a 1:2 demux on S3 feeding two 1:8 demuxes.
module demux_1to16 (
    input  wire        i,
    input  wire [3:0]  s,
    output wire [15:0] y
);
    wire lo, hi;

    demux_1to2 d_top (
        .s(s[3]),
        .i(i),
        .y0(lo),
        .y1(hi)
    );

    demux_1to8 d_lo (
        .i(lo),
        .s(s[2:0]),
        .y(y[7:0])
    );

    demux_1to8 d_hi (
        .i(hi),
        .s(s[2:0]),
        .y(y[15:8])
    );
endmodule
