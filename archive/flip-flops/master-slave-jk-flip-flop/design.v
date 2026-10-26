// Master-slave JK flip-flop: a master latch open while clk is high feeds a slave latch open while clk is low.
module master_slave_jk_flip_flop (
    input  wire clk,
    input  wire j,
    input  wire k,
    output wire q,
    output wire qn
);
    reg m;        // master latch output
    reg q_s;      // slave latch output

    // master: transparent while clk is high, computes the JK next state from the slave output
    always @(*)
        if (clk)
            case ({j, k})
                2'b00: m = q_s;
                2'b01: m = 1'b0;
                2'b10: m = 1'b1;
                2'b11: m = ~q_s;
            endcase

    // slave: transparent while clk is low, copies the master
    always @(*)
        if (!clk)
            q_s = m;

    assign q  = q_s;
    assign qn = ~q_s;
endmodule
