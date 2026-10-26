// Turns a 2-bit code into one active line out of four, gated by an enable input.
module decoder_2to4 (
    input  wire       en,
    input  wire [1:0] a,
    output wire [3:0] y
);
    assign y[0] = en & ~a[1] & ~a[0];
    assign y[1] = en & ~a[1] &  a[0];
    assign y[2] = en &  a[1] & ~a[0];
    assign y[3] = en &  a[1] &  a[0];
endmodule
