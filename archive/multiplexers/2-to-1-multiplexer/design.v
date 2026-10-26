// Selects one of two data inputs based on a single select line.
module mux_2to1 (
    input  wire s,
    input  wire i0,
    input  wire i1,
    output wire y
);
    assign y = (~s & i0) | (s & i1);
endmodule