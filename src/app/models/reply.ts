export class Reply {


    constructor(

        public user_id: number,
        public comment_id: number,
        public response: string,
        public id?: number,
    ) { }
}