import { AppConfig } from "../../../shared/config";

export const triggerEvent = (
  config: AppConfig,
  entityName: string,
  action: "CREATE" | "UPDATE" | "DELETE",
  data: any
) => {
  const entity = config.entities.find((e) => e.name === entityName);

  if (!entity || !entity.enableEvents) {
    return;
  }

  // In a real system, this would push to a queue (e.g. RabbitMQ, Redis, SNS)
  // or trigger webhooks. For this platform, we log or send a mock notification.
  console.log(`\n🔔 [EVENT NOTIFICATION] Action: ${action} on Entity: ${entityName}`);
  console.log(`   Payload:`, JSON.stringify(data));
  
  if (action === "CREATE") {
    console.log(`   Mock Email: "New ${entityName} created with ID ${data.id}" sent to admins.`);
  }
};
