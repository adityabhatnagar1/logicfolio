// Routes one data input to one of four outputs using a 1:2 demux on S1 feeding two 1:2 demuxes on S0.
module demux_1to4 (
    input  wire       i,
    input  wire [1:0] s,
    output wire [3:0] y
);
    wire a0, a1;

    demux_1to2 d_top (
        .s(s[1]),
        .i(i),
        .y0(a0),
        .y1(a1)
    );

    demux_1to2 d_lo (
        .s(s[0]),
        .i(a0),
        .y0(y[0]),
        .y1(y[1])
    );

    demux_1to2 d_hi (
        .s(s[0]),
        .i(a1),
        .y0(y[2]),
        .y1(y[3])
    );
endmodule
