"use client";
import { toast } from "@/hooks/use-toast";
import { incrementViews } from "@/lib/actions/question.action";
import React, { useEffect } from "react";

const View = ({ questionId }: { questionId: string }) => {
  const handleIncrement = async () => {
    const result = await incrementViews({ questionId });

    if (result.success) {
      toast({
        title: "Success",
        description: "Views incremented",
      });
    } else {
      toast({
        title: "Error",
        description: result.error?.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    handleIncrement();
  }, []);
  return <div>View</div>;
};

export default View;
