// SR latch built from two cross-coupled NOR gates; S sets Q to 1, R resets Q to 0.
module sr_latch (
    input  wire s,
    input  wire r,
    output wire q,
    output wire qn
);
    assign q  = ~(r | qn);
    assign qn = ~(s | q);
endmodule
