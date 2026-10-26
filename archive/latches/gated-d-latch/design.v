// Gated D latch: follows d while en is high and holds the last value while en is low.
module gated_d_latch (
    input  wire en,
    input  wire d,
    output wire q,
    output wire qn
);
    wire s_g = en & d;
    wire r_g = en & ~d;

    assign q  = ~(r_g | qn);
    assign qn = ~(s_g | q);
endmodule
