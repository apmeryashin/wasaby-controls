/**
 * Created by as.krasilnikov on 21.03.2018.
 */

export class NotificationStrategy {
   getPosition(offsetRight: number, offsetBottom: number): object {
      return {
         right: offsetRight,
         bottom: offsetBottom
      };
   }
}

export default new NotificationStrategy();
