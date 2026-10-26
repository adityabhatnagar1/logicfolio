// Selects one of four data inputs using two 2:1 muxes in the first stage and one in the second.
module mux_4to1 (
    input  wire [1:0] s,
    input  wire [3:0] i,
    output wire       y
);
    wire lo, hi;

    mux_2to1 m_lo (
        .s(s[0]),
        .i0(i[0]),
        .i1(i[1]),
        .y(lo)
    );

    mux_2to1 m_hi (
        .s(s[0]),
        .i0(i[2]),
        .i1(i[3]),
        .y(hi)
    );

    mux_2to1 m_out (
        .s(s[1]),
        .i0(lo),
        .i1(hi),
        .y(y)
    );
endmodule