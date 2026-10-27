// Routes one data input to one of two outputs based on a single select line.
module demux_1to2 (
    input  wire s,
    input  wire i,
    output wire y0,
    output wire y1
);
    assign y0 = ~s & i;
    assign y1 = s & i;
endmodule
