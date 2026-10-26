`timescale 1ns/1ps
module tb_sr_latch;
    reg  s, r;
    wire q, qn;
    integer i, errors;

    sr_latch dut (
        .s(s),
        .r(r),
        .q(q),
        .qn(qn)
    );

    task apply;
        input s_in;
        input r_in;
        input exp_q;
        input exp_qn;
        begin
            s = s_in;
            r = r_in;
            #10;
            if (q !== exp_q || qn !== exp_qn) begin
                errors = errors + 1;
                $display("FAIL s=%b r=%b : q=%b qn=%b (expected q=%b qn=%b)", s, r, q, qn, exp_q, exp_qn);
            end
        end
    endtask

    initial begin
        $dumpfile("sr_latch.vcd");
        $dumpvars(0, tb_sr_latch);
        errors = 0;

        apply(0, 1, 0, 1);   // reset
        apply(0, 0, 0, 1);   // hold 0
        apply(1, 0, 1, 0);   // set
        apply(0, 0, 1, 0);   // hold 1
        for (i = 0; i < 3; i = i + 1) begin
            apply(0, 1, 0, 1);   // reset
            apply(0, 0, 0, 1);   // hold 0
            apply(1, 0, 1, 0);   // set
            apply(0, 0, 1, 0);   // hold 1
        end
        apply(1, 1, 0, 0);   // forbidden: both outputs forced low
        apply(0, 1, 0, 1);   // leave through reset
        apply(1, 1, 0, 0);
        apply(1, 0, 1, 0);   // leave through set

        $display("sr_latch: %0d errors", errors);
        $finish;
    end
endmodule
