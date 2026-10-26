// Selects one of eight data inputs using two 4:1 muxes feeding a final 2:1 mux.
module mux_8to1 (
    input  wire [2:0] s,
    input  wire [7:0] i,
    output wire       y
);
    wire lo, hi;

    mux_4to1 m_lo (
        .s(s[1:0]),
        .i(i[3:0]),
        .y(lo)
    );

    mux_4to1 m_hi (
        .s(s[1:0]),
        .i(i[7:4]),
        .y(hi)
    );

    mux_2to1 m_out (
        .s(s[2]),
        .i0(lo),
        .i1(hi),
        .y(y)
    );
endmodule