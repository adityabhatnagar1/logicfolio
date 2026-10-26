// Turns a 3-bit code into one active line out of eight, gated by an enable input.
module decoder_3to8 (
    input  wire       en,
    input  wire [2:0] a,
    output wire [7:0] y
);
    assign y[0] = en & (a == 3'd0);
    assign y[1] = en & (a == 3'd1);
    assign y[2] = en & (a == 3'd2);
    assign y[3] = en & (a == 3'd3);
    assign y[4] = en & (a == 3'd4);
    assign y[5] = en & (a == 3'd5);
    assign y[6] = en & (a == 3'd6);
    assign y[7] = en & (a == 3'd7);
endmodule
