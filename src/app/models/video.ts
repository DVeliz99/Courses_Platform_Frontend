export class Video {


    constructor(
        public user_id: number,
        public course_id: number,
        public title: string,
        public content: string,
        public url: string,
        public section: number,
        public title_accordion?: string,
        public file?: string,
        public id?: number
    ) { }
}