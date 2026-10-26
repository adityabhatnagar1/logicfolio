// Selects one of sixteen data inputs using two 8:1 muxes feeding a final 2:1 mux.
module mux_16to1 (
    input  wire [3:0]  s,
    input  wire [15:0] i,
    output wire        y
);
    wire lo, hi;

    mux_8to1 m_lo (
        .s(s[2:0]),
        .i(i[7:0]),
        .y(lo)
    );

    mux_8to1 m_hi (
        .s(s[2:0]),
        .i(i[15:8]),
        .y(hi)
    );

    mux_2to1 m_out (
        .s(s[3]),
        .i0(lo),
        .i1(hi),
        .y(y)
    );
endmodule