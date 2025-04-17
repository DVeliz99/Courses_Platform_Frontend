export class Course {


    constructor(
        public category_id: number,
        public name: string,
        public detail: string,
        public image: string,
        public url: string,
        public accordion: number,
        public price_before: number,
        public price_now: number,
        public id?: number,
        ) { }
}