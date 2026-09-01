import redis from "../lib/redis.js";

const rateLimiter = async(req, res, next)=>{    
    try{
        const ip= req.ip;
        const key= `Rate_Limit:${ip}`;
        const requests= await redis.incr(key); // store the count of a key and return the number of count as well 
        if(requests == 1 ){ // jab pehla request aaye us  key pr uske 60 seceond baad wo key destroy ho jaye means there can be only 5 request at a minute for each ip 
            await redis.expire(key,60);
        } 
        if(requests > 5){
            return res.status(429).json({
                "message":"Too many Request"
            })
        }

        next();
        
    }catch(error){
        return res.status(500).json({
            'Message':"Internal Server Error"
        })
    }
}

export default rateLimiter;