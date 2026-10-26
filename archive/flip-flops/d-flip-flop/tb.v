`timescale 1ns/1ps
module tb_d_flip_flop;
    reg  clk, d;
    wire q;
    reg  exp;
    integer i, errors;

    d_flip_flop dut (
        .clk(clk),
        .d(d),
        .q(q)
    );

    initial begin
        $dumpfile("d_flip_flop.vcd");
        $dumpvars(0, tb_d_flip_flop);
        errors = 0;
        clk = 0;
        d = 0;

        for (i = 0; i < 8; i = i + 1) begin
            d = i[0];
            exp = d;
            #5 clk = 1;
            #1;
            if (q !== exp) begin
                errors = errors + 1;
                $display("FAIL i=%0d d=%b : q=%b (expected %b)", i, d, q, exp);
            end
            d = ~d;          // change d after the edge: q must not follow
            #2;
            if (q !== exp) begin
                errors = errors + 1;
                $display("FAIL i=%0d d moved after edge : q=%b (expected %b)", i, q, exp);
            end
            #2 clk = 0;
            #5;
        end

        $display("d_flip_flop: %0d errors", errors);
        $finish;
    end
endmodule
