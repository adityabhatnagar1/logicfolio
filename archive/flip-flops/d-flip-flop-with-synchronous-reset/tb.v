`timescale 1ns/1ps
module tb_d_flip_flop_with_synchronous_reset;
    reg  clk, rst, d;
    wire q;
    reg  exp;
    integer i, errors;

    d_flip_flop_with_synchronous_reset dut (
        .clk(clk),
        .rst(rst),
        .d(d),
        .q(q)
    );

    task tick;
        begin
            #5 clk = 1;
            #5 clk = 0;
        end
    endtask

    initial begin
        $dumpfile("d_flip_flop_with_synchronous_reset.vcd");
        $dumpvars(0, tb_d_flip_flop_with_synchronous_reset);
        errors = 0;
        clk = 0;

        // i[2] = value stored first, i[1] = rst, i[0] = d
        for (i = 0; i < 8; i = i + 1) begin
            rst = 0;
            d   = i[2];
            tick;
            rst = i[1];
            d   = i[0];
            #1;
            if (q !== i[2]) begin   // no clock edge yet, so no change
                errors = errors + 1;
                $display("FAIL i=%0d : q changed before the clock edge (q=%b)", i, q);
            end
            tick;
            exp = i[1] ? 1'b0 : i[0];
            if (q !== exp) begin
                errors = errors + 1;
                $display("FAIL old=%b rst=%b d=%b : q=%b (expected %b)", i[2], rst, d, q, exp);
            end
        end

        $display("d_flip_flop_with_synchronous_reset: %0d errors", errors);
        $finish;
    end
endmodule
