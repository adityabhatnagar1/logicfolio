`timescale 1ns/1ps
module tb_jk_flip_flop;
    reg  clk, j, k;
    wire q;
    reg  exp;
    integer i, errors;

    jk_flip_flop dut (
        .clk(clk),
        .j(j),
        .k(k),
        .q(q)
    );

    task tick;
        begin
            #5 clk = 1;
            #5 clk = 0;
        end
    endtask

    initial begin
        $dumpfile("jk_flip_flop.vcd");
        $dumpvars(0, tb_jk_flip_flop);
        errors = 0;
        clk = 0;

        // i[2] = value stored first, i[1:0] = {j,k}
        for (i = 0; i < 8; i = i + 1) begin
            {j, k} = i[2] ? 2'b10 : 2'b01;   // force a known starting value
            tick;
            {j, k} = i[1:0];
            case (i[1:0])
                2'b00:   exp = i[2];
                2'b01:   exp = 1'b0;
                2'b10:   exp = 1'b1;
                default: exp = ~i[2];
            endcase
            tick;
            if (q !== exp) begin
                errors = errors + 1;
                $display("FAIL old=%b j=%b k=%b : q=%b (expected %b)", i[2], j, k, q, exp);
            end
        end

        // toggle mode: q should flip on every clock
        {j, k} = 2'b11;
        exp = q;
        for (i = 0; i < 6; i = i + 1) begin
            exp = ~exp;
            tick;
            if (q !== exp) begin
                errors = errors + 1;
                $display("FAIL toggle %0d : q=%b (expected %b)", i, q, exp);
            end
        end

        $display("jk_flip_flop: %0d errors", errors);
        $finish;
    end
endmodule
