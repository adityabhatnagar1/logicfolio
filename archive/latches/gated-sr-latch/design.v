// Gated SR latch: an SR latch whose set and reset inputs only act while en is high.
module gated_sr_latch (
    input  wire en,
    input  wire s,
    input  wire r,
    output wire q,
    output wire qn
);
    wire s_g = en & s;
    wire r_g = en & r;

    assign q  = ~(r_g | qn);
    assign qn = ~(s_g | q);
endmodule
