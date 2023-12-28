"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { LoadingDots } from "~/ui/loading-dots";
import { settingsValidator } from "~/lib/validators";
import { trpc } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/root";
import { Button } from "~/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "~/ui/form";
import { Input } from "~/ui/input";
import { useFieldArray } from "react-hook-form";

export function SettingsForm(props: {
  initialSettings: RouterOutputs["app"]["info"];
}) {
  const form = useForm({
    schema: settingsValidator,
    defaultValues: props.initialSettings,
  });
  const fa = useFieldArray({
    control: form.control,
    // @ts-expect-error - idk why this is...
    name: "treatoes",
  });

  const router = useRouter();
  const updateApp = trpc.app.update.useMutation();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          const newSettings = await updateApp.mutateAsync(data);
          toast("Settings updated", {
            description: <pre>{JSON.stringify(newSettings, null, 4)}</pre>,
          });
          form.reset({}, { keepValues: true });
          router.refresh();
        })}
        className="flex flex-col gap-2 max-w-md"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="treatoes"
          render={() => (
            <FormItem>
              <FormLabel>Treatoes</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-4">
                  {fa.fields.map((field, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        key={field.id}
                        {...form.register(`treatoes.${i}`)}
                      />
                      <Button
                        type="button"
                        onClick={() => fa.remove(i)}
                        variant="destructive"
                      >
                        -
                      </Button>
                    </div>
                  ))}
                  <FormMessage />

                  <Button
                    type="button"
                    onClick={() => fa.append([""])}
                    className="self-end"
                  >
                    +
                  </Button>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <Button disabled={!form.formState.isDirty}>
          {(form.formState.isSubmitting || updateApp.isPending) && (
            <LoadingDots className="mr-2" />
          )}
          Submit
        </Button>
      </form>
    </Form>
  );
}