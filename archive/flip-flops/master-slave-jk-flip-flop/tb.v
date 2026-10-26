`timescale 1ns/1ps
module tb_master_slave_jk_flip_flop;
    reg  clk, j, k;
    wire q, qn;
    reg  exp;
    integer i, errors;

    master_slave_jk_flip_flop dut (
        .clk(clk),
        .j(j),
        .k(k),
        .q(q),
        .qn(qn)
    );

    initial begin
        $dumpfile("master_slave_jk_flip_flop.vcd");
        $dumpvars(0, tb_master_slave_jk_flip_flop);
        errors = 0;
        clk = 0;

        // i[2] = value stored first, i[1:0] = {j,k}
        for (i = 0; i < 8; i = i + 1) begin
            {j, k} = i[2] ? 2'b10 : 2'b01;   // force a known starting value
            #5 clk = 1;
            #5 clk = 0;
            #1;
            if (q !== i[2]) begin
                errors = errors + 1;
                $display("FAIL load i=%0d : q=%b (expected %b)", i, q, i[2]);
            end

            {j, k} = i[1:0];
            case (i[1:0])
                2'b00:   exp = i[2];
                2'b01:   exp = 1'b0;
                2'b10:   exp = 1'b1;
                default: exp = ~i[2];
            endcase
            #4 clk = 1;
            #2;
            if (q !== i[2]) begin   // output must not move while clk is high
                errors = errors + 1;
                $display("FAIL old=%b j=%b k=%b : q moved while clk high (q=%b)", i[2], j, k, q);
            end
            #3 clk = 0;
            #2;
            if (q !== exp || qn !== ~exp) begin
                errors = errors + 1;
                $display("FAIL old=%b j=%b k=%b : q=%b qn=%b (expected q=%b)", i[2], j, k, q, qn, exp);
            end
            #3;
        end

        // toggle mode: q flips once per full clock pulse, on the falling edge
        {j, k} = 2'b11;
        exp = q;
        for (i = 0; i < 6; i = i + 1) begin
            exp = ~exp;
            #5 clk = 1;
            #5 clk = 0;
            #1;
            if (q !== exp) begin
                errors = errors + 1;
                $display("FAIL toggle %0d : q=%b (expected %b)", i, q, exp);
            end
        end

        $display("master_slave_jk_flip_flop: %0d errors", errors);
        $finish;
    end
endmodule
