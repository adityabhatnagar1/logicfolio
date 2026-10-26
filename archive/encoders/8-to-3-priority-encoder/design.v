// Encodes the highest-numbered active line of eight inputs into a 3-bit code with a valid flag.
module priority_encoder_8to3 (
    input  wire [7:0] d,
    output wire [2:0] y,
    output wire       v
);
    assign y[2] = d[7] | d[6] | d[5] | d[4];
    assign y[1] = d[7] | d[6] | (~d[5] & ~d[4] & (d[3] | d[2]));
    assign y[0] = d[7]
                | (~d[6] & d[5])
                | (~d[6] & ~d[4] & d[3])
                | (~d[6] & ~d[4] & ~d[2] & d[1]);
    assign v    = |d;
endmodule
