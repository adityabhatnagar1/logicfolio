// JK flip-flop: J sets, K resets, both high toggle q, all on the rising clock edge.
module jk_flip_flop (
    input  wire clk,
    input  wire j,
    input  wire k,
    output reg  q
);
    always @(posedge clk)
        case ({j, k})
            2'b00: q <= q;
            2'b01: q <= 1'b0;
            2'b10: q <= 1'b1;
            2'b11: q <= ~q;
        endcase
endmodule
