import { Prisma } from "@prisma/client";
import { ReturnUserObject } from "src/user/return.user.Object";

export const ReturnReviewObject: Prisma.ReviewSelect = {
    newuser  :{ select:ReturnUserObject},
    id: true,         
    createAt: true,   
    rating:true,      
    text:true   

}