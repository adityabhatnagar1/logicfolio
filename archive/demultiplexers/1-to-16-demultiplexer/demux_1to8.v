// Routes one data input to one of eight outputs using a 1:2 demux on S2 feeding two 1:4 demuxes.
module demux_1to8 (
    input  wire       i,
    input  wire [2:0] s,
    output wire [7:0] y
);
    wire lo, hi;

    demux_1to2 d_top (
        .s(s[2]),
        .i(i),
        .y0(lo),
        .y1(hi)
    );

    demux_1to4 d_lo (
        .i(lo),
        .s(s[1:0]),
        .y(y[3:0])
    );

    demux_1to4 d_hi (
        .i(hi),
        .s(s[1:0]),
        .y(y[7:4])
    );
endmodule
