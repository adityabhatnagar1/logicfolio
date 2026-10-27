// Encodes the highest-numbered active line of four inputs into a 2-bit code with a valid flag.
module priority_encoder_4to2 (
    input  wire [3:0] d,
    output wire [1:0] y,
    output wire       v
);
    assign y[1] = d[3] | d[2];
    assign y[0] = d[3] | (~d[2] & d[1]);
    assign v    = d[3] | d[2] | d[1] | d[0];
endmodule
